import express from "express"
const signal_server = process.env.SIGNAL_SERVER
const app = express()
import ejs from "ejs"
import { join } from "path"
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.set('view engine', 'ejs')
const render = (f:string, ops?: any) => {
    return ejs.render(Bun.file(join(__dirname, 'views', f)).toString())
}
app.get('/', (req, res) => {
    res.send(render(`index.ejs`))
})
app.listen(3000, () => {
    console.log('server is running on port 3000')
})