export default async function loginUser(credentials) {
    return fetch('http://localhost:3000/', { //
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  })
    .then(data => data.text())
  }


