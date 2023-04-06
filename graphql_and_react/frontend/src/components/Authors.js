import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'

const SET_BIRTH_YEAR = gql`
mutation editAuthor($name: String!, $born: Int!) {
  editAuthor(name: $name, born: $born) {
    name
    born
    id
  }
}
`


const ALL_BOOKS = gql`
  query  {
    allBooks  {
      title
      published
      author
      id
      genres
    }
  }
`

const ALL_AUTHORS = gql`
  query  {
    allAuthors  {
        name
        bookCount
        born
    }
  }
`

const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [ editAuthor ] = useMutation(SET_BIRTH_YEAR, {
    refetchQueries: [ { query: ALL_BOOKS }, { query: ALL_AUTHORS } ]
  })

  const submit = async (event) => {
    event.preventDefault()

    console.log('Set birthyear...')
    editAuthor({  variables: { name, born } })

    setName('')
    setBorn('')
  }

  if (!props.show) {
    return null
  }
  const authors = props.a
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
      <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
          />
        </div>
      <button type="submit">Set birthyear</button>
      </form>
    </div>
  )
}

export default Authors
