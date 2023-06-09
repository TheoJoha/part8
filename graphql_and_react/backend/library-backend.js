const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conección con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

/*
  you can remove the placeholder query once your first own has been implemented 
*/

const typeDefs = `
  type Query {
    dummy: Int
    booksCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [NameAndBookCount!]!
  }

  type Book {
    title: String!
    published: Int
    author: String
    id: ID
    genres: [String]
  }

  type Author {
    name: String!
    born: Int
    id: ID
  }

  type NameAndBookCount {
    name: String!
    bookCount: Int!
    born: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int
      genres: [String]
    ): Book
    editAuthor(
      name: String! 
      born: Int!
      ): Author
  }
`

const resolvers = {
  Query: {
    dummy: () => 0,
    booksCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      const listOfBooks = []
      // if neither author nor genre is given
      if (args.author == undefined && args.genre == undefined) {
        return books
      }
      // if author and genre are given
      else if (args.author != undefined && args.genre != undefined) {
        books.forEach(book => {
          if (book.author == args.author) {
            if (book.genres.indexOf(args.genre) > -1) {
              listOfBooks.push(book)
            }
          }
        })
      }
      // if only author is given
      else if (args.author != undefined) {
        books.forEach(book => {
          if (book.author == args.author) {
            listOfBooks.push(book)
          }
      })
      }
      // if only genre is given
      else {
        books.forEach(book => {
          if (book.genres.indexOf(args.genre) > -1) {
            listOfBooks.push(book)
          }
      })
      }

      return listOfBooks
    },
    allAuthors: () => {
      
      const nameBookCountList = []

      authors.forEach(authorObj => {

        const nameBookCountDict = {}
        nameBookCountDict['bookCount'] = 0
        nameBookCountDict['name'] = authorObj.name
        nameBookCountDict['born'] = authorObj.born
        books.forEach(innerAuthorObj => {
        if (authorObj.name == innerAuthorObj.author) {
          if (nameBookCountDict[innerAuthorObj.author] != 0) {
            nameBookCountDict["bookCount"] += 1
          }
          else {
            nameBookCountDict["bookCount"] = 1
          }
        }
        
        }
        )
        nameBookCountList.push(nameBookCountDict)
      }
      
      )
      return nameBookCountList
    },
  },

  Book: {
    title: (root) => root.title,
    published: (root) => root.published,
    author: (root) => root.author,
    id: (root) => root.id,
    genres: (root) => root.genres
  },

  Mutation: {
    addBook: (root, args) => {
      const book = { ...args, id: uuid() }
      books = books.concat(book)
      // check if new author and if so then add to authors
      let alreadyStoredAuthor = false
      authors.forEach(author => {
        if (author.name == args.author) {
          alreadyStoredAuthor = true
        }
      })
      if (alreadyStoredAuthor === false) {
        authors = authors.concat({"name": args.author})
      }
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(p => p.name === args.name)
      if (!author) {
        return null
      }
  
      const updatedAuthor = { ...author, born: args.born }
      authors = authors.map(p => p.name === args.name ? updatedAuthor : p)
      return updatedAuthor
    }   
  },


}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})