import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery } from '@apollo/client'

const ALL_BOOKS = gql`
query {
  allBooks { 
    title 
    author
    published 
    genres
  }
}
`

const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')
  console.log(page)

  const allBooks = useQuery(ALL_BOOKS)
  const allAuthors = useQuery(ALL_AUTHORS)

  if (allBooks.loading || allAuthors.loading) {
    return <div>loading...</div>
  }


  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} a={allAuthors.data.allAuthors} />

      <Books show={page === 'books'} a={allBooks.data.allBooks}/>

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
