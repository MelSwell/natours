const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes.js')
const userRouter = require('./routes/userRoutes.js')

const app = express()

////// MIDDLEWARE ///////
app.use(morgan('dev'))
app.use(express.json())

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})


////// ROUTES ///////

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

////// START ///////
const port = 3000
app.listen(port, () => {
  console.log(`listening on port ${port}...`)
})