import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express()

app.use(cors());
app.use(express.json())

// Visa allt i list
app.get('/', async (req, res) => {
    try {
        const allFood = await Food.find();
        res.send(allFood);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

// Hitta med id
app.get('/find/:id', async (req, res) => {
    const food = await Food.findById(req.params.id)
    if (!food) {
        return res.status(404).send('Food not found');
    }
    res.send(food)
})

// Lägga till maten
app.post('/add', async (req, res) => {
    const food = await Food.create(req.body)
    res.send(food)
})

// Ta bort maten
app.delete('/delete/:id', async (req, res) => {
    await Food.findByIdAndDelete(req.params.id)
    res.send({
        status:true
    })
})

// Uppdatera maten
app.put('/update/:id', async (req, res) => {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body)
    res.send(food)
})

// Hitta maten med pid
app.get('/findByPID/:pid', async (req, res) => {
    const food = await Food.find({'pid': req.params.pid})
    res.send(food)
})

// Hitta maten med namn
app.get('/findByName', (req, res) => {
    const result = {
        data: [],
        totoal: ''
    }

    var confident = new RegExp(req.query.names)

    var query = Food.find({$or: [{"name": confident}]})
    query.count({}, function(err, count) {
        if(err) {
            res.json(err)
        }else {
            result.totoal = count
        }
    })

    pageSize = parseInt(req.query.pageSize)
    currentPage = parseInt(req.query.currentPage)
    Food.find({}, (err,data)=>{
        result.data = data
        res.send(result)
    }).where({$or: [{"name": confident}]}).skip((currentPage - 1) * pageSize).limit(pageSize)
})

// Paginerad lista
app.all('/foodList', (req, res) => {
    const result = {
        data: [],
        totoal: ''
    }

    var confident = new RegExp(req.query.names)

    var query = Food.find({})
    query.count({}, function(err, count) {
        if(err) {
            res.json(err)
        }else {
            result.totoal = count
        }
    })

    pageSize = parseInt(req.query.pageSize)
    currentPage = parseInt(req.query.currentPage)
    Food.find({}, (err,data)=>{
        result.data = data
        res.send(result)
    }).skip((currentPage - 1) * pageSize).limit(pageSize)
})


mongoose.connect('mongodb://localhost:27017/warehouse', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})

const Food = mongoose.model('Food', new mongoose.Schema({
    pid: { type: String },
    name: { type: String },
    type: { type: String },
    count: { type: Number },
    date: { type: Date },
    description: { type: String }
}))

app.listen(3001, () => {
    console.log('http://localhost:3001/')
})