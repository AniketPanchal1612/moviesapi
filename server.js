const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');
// app.use(express.json());
dotenv.config({ path: './.env' })


const PORT = process.env.PORT || 4000
const URI = process.env.DB_URI

// console.log(PORT)
// console.log(URI)
MongoClient.connect(URI)
    .then(client => {
        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server listening on ${PORT}`)
        })



        const db = client.db('Movies');
        const movies = db.collection('movies');

        app.use(cors());
        app.use(express.json());


        //create new movies
        app.post('/movie', async (req, res) => {
            try {
                const result = await movies.insertOne(req.body);
                res.status(201).json({
                    success: true,
                    data: result
                });
            } catch (err) {
                res.status(500).json({
                    success: false
                });
            }
        });

        //get all movies
        app.get('/movies', async (req, res) => {
            const {page} = req.query; 
            const limit = 10; 
            const skip = page ? (page - 1) * limit : 0; 

            try {
                const totalMovies = await movies.countDocuments();
                let results;
                if (page) {
                    results = await movies.find({}).skip(skip).limit(limit).toArray();
                } else {
                    results = await movies.find({}).toArray();
                }
                res.status(200).json({
                    success: true,
                    resPerPage: results.length,
                    MoviesLength: totalMovies,
                    data: results
                });
            } catch (err) {
                res.status(500).json({
                    success: false
                });
            }
        });

        //get single movie
        app.get('/movie/:id', async (req, res) => {
            try {
                const movieId = req.params.id;
                const ObjId = new ObjectId(movieId);
                // console.log(movieId);
                // console.log(ObjId);
                const movie = await movies.findOne({ _id: ObjId });
                if (!movie) {
                    return res.status(404).json({
                        success: false,
                        message: `Movie with id ${movieId} not found`,
                    });
                }
                res.status(200).json({
                    success: true,
                    data: movie,
                });
            } catch (err) {
                res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }
        
        });

        app.delete('/movie/:id', async (req, res) => {
            try {
                const movieId = req.params.id;
                const ObjId = new ObjectId(movieId);
                const result = await movies.deleteOne({ _id: ObjId });
                if (result.deletedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `Movie with id ${movieId} not found`,
                    });
                }
                res.status(200).json({
                    success: true,
                    message: `Movie with id ${movieId} deleted successfully`,
                });
            } catch (err) {
                res.status(500).json({
                    success: false,
                    message: err.message,
                });
            }
        });
    })
    .catch(error => {
        console.log(error.message);
    })