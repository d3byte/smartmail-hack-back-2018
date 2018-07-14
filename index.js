const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const _ = require('lodash')

const app = express()

app.use(cors())
app.use(bodyParser.json())

// Get list of users in directory
app.get('/users', (req, res) => {
    const { offset, folder } = req.query
    axios.get('http://e.mail.ru/api/v1/messages/search', {
        params: {
            access_token: "7c14c7013042745c88344919c73bd0eb1c0c5fb537363830",
            email: "smartmail_team4@mail.ru",
            offset,
            folder,
            limit: 25,
            snippet_limit: 100,
            flags: {
                attach: true
            }
        }
    }).then((response) => {
        const messages = response.data.body.messages
        if (messages !== undefined) {
            let array = messages.map(item => {
                return {
                    email: item.correspondents.from[0].email,
                    name: item.correspondents.from[0].name
                }
            })
            array = _.uniqBy(array, 'email')
            return res.json({ users: array, offset, folder })
        } else return res.json({ users: [], offset, folder })
    })
    .catch((error) => {
        console.log(error);
    })
})

// Get user letters
app.get('/get-users-letters', (req, res) => {
    const { offset, from, folder } = req.query
    axios.get('http://e.mail.ru/api/v1/messages/search', {
        params: {
            access_token: "7c14c7013042745c88344919c73bd0eb1c0c5fb537363830",
            email: "smartmail_team4@mail.ru",
            offset,
            folder,
            limit: 25,
            snippet_limit: 100,
            flags: {
                attach: true
            },
            correspondents: {
                from
            }
        }
    }).then((response) => {
        const messages = response.data.body.messages
        if (messages !== undefined) {
            let array = messages.map(item => {
                return {
                    id: item.id,
                    subject: item.subject,
                    date: item.date
                }
            })
            return res.json({ subjects: array, offset, folder })
        } else return res.json({ users: [], offset, folder })
    })
    .catch((error) => {
        console.log(error);
    })
})

// Get attaches in user letter
app.get('/get-attaches-letter', (req, res) => {
    const { id, date } = req.query
    axios.get('http://e.mail.ru/api/v1/messages/attaches', {
        params: {
            access_token: "7c14c7013042745c88344919c73bd0eb1c0c5fb537363830",
            email: "smartmail_team4@mail.ru",
            id
        }
    }).then((response) => {
        let dateLocal = new Date(date * 1000 + 360 * 30000)
        const array = response.data.body
        let files = array.map(file => Object.assign(
            {},
            { date: dateLocal },
            file
        ))
        return res.json({ files, id, date })
    })
    .catch((error) => {
        console.log(error);
    })
})

// Get lists of directory
app.get('/get-directories', (req, res) => {
    axios.get('http://e.mail.ru/api/v1/folders', {
        params: {
            access_token: "7c14c7013042745c88344919c73bd0eb1c0c5fb537363830",
            email: "smartmail_team4@mail.ru"
        }
    }).then((response) => {
        const array = response.data.body
        let arr = array.map(item => {
            return {
                id: item.id,
                type: item.type,
                name: item.name,
                messages_unread: item.messages_unread,
                messages_total: item.messages_total,
                messages_with_attachments: item.messages_with_attachments
            }
        })
        return res.json({ folders: arr })
    })
    .catch((error) => {
        console.log(error);
    })
})

app.listen(3000, () => console.log('Server is running on 3000'))