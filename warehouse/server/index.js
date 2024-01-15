import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express()

app.use(cors());
app.use(express.json())

// Visa allt i list
app.get('/', async (req, res) => {
    try {
        const allFood = await Food.find().exec();
        res.send(allFood);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

// Hitta med id
app.get('/find/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).send('Food not found');
        }
        res.send(food);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Paginerad lista
app.get('/foodList', async (req, res) => {
    try {
        const result = {
            data: [],
            total: ''
        }

        const pageSize = parseInt(req.query.pageSize) || 10;
        const currentPage = parseInt(req.query.currentPage) || 1;

        const count = await Food.countDocuments({});
        result.total = count;

        const data = await Food.find({})
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .lean()
            .exec();

        result.data = data;

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


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
app.get('/findByName/:names', async (req, res) => {
    try {
        const result = {
            data: [],
            total: 0
        }

        const confident = new RegExp(req.params.names || '', 'i'); // Lägg till "i"-flaggan

        const aggregatePipeline = [
            {
                $match: { "name": confident } // Använd reguljära uttryck direkt
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1
                }
            }
        ];

        const countResult = await Food.aggregate(aggregatePipeline);

        if (countResult.length > 0) {
            result.total = countResult[0].total;
        }

        const pageSize = parseInt(req.query.pageSize) || 10;
        const currentPage = parseInt(req.query.currentPage) || 1;

        const data = await Food.find({ "name": confident })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

        result.data = data;
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

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

// Fel vid hantering av mellanprogram
const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
};

// Använd mellanprogram för felhantering efter alla rutter
app.use(errorHandler);

app.listen(3001, () => {
    console.log('http://localhost:3001/')
})