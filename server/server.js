require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const db = require("./db"); // "./db" will automatically look for index.js, so no need to type "./db/index.js"
const cors = require("cors");
app.use(cors());
/*
In line 7 of package.json, this...
// "test": "echo \"Error: no test specified\" && exit 1"
...is replaced with this...
// "start": "nodemon server.js"
so no need to type "nodemon server.js" in the terminal, just "npm start"
*/

/*
app.get("/getRestaurants", (req, res) => { //will be triggered with "http://localhost:3001/getRestaurants"
  console.log("get all restaurants");
  // res.send("these are the restaurants"); //cannot run res.send and res.json at the same time
  res.status(404).json({
    status: "success",
    restaurant: "mcdonalds"
  })
});
*/

// middleware - any http request will run this, before going to its intended rest api route handler or the next middleware with the "next();" function
// Why is this middleware read first? because for every http request, it will read the code from top to bottom
// If this is placed below all other rest api route handlers(and the http request matches one of the route handlers), then this middleware will not be run, because it stops when it finds a fitting rest api route handler
app.use((req, res, next) => {
  console.log("yeah our middleware");
  next();
});

app.use((req, res, next) => {
  console.log("middleware no.2");
  next();
});

// app.use((req, res, next) => { // This will prevent any api route handlers from getting reached
//   res.status(404).json({
//     status: "fail",
//   });
// });

// npm i mrgan
app.use(morgan("dev")); // third party middleware, just summarizes what request you did

app.use(express.json()); // express.js middleware, when an information is sent (request), the request's body information (like json) will be attached to the request object, in the body property 


// ==================================================================
// Crud - POST   - create restaurant        - http://localhost:3001/api/v1/restaurants
app.post("/api/v1/restaurants", async(req, res) => {
  try {
    console.log("rest api route handler = POST create a restaurant");
    // console.log(req.body);
    // console.log("INSERT INTO restaurants (name, location, price_range) values ($1, $2, $3)", [req.body.name, req.body.location, req.body.price_range]);
    const results = await db.query("INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) RETURNING *", [req.body.name, req.body.location, req.body.price_range]);
    // console.log(results.rows[0]);
    res.status(201).json({
      status: "success",
      data:{
        restaurant: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err.message);
  }
});
// ==================================================================


app.use((req, res, next) => {
  console.log("middleware no.3 - you did not do a POST method");
  next();
});



// ==================================================================
// cRud - GET    - retrieve all restaurants - http://localhost:3001/api/v1/restaurants
app.get("/api/v1/restaurants", async(req, res) => {
  try{
    console.log("rest api route handler = GET retireve all restaurants")
    const results = await db.query("SELECT * FROM restaurants ORDER BY id ASC");
    console.log("results: ", results);
    // "restaurantRatingsData" returns more data than "results", needed for the average star rating and review count at the home page
    const restaurantRatingsData = await db.query("SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id");
    console.log("restaurant data: ", restaurantRatingsData);
    /*
    console.log(req.body);
    res.status(200).json({
      status: "success",
      data:{
        restaurant: ["mcdonalds", "wendys"],
      }
    });
    */
   /*
    res.status(200).json({
      status: "success",
      results: results.rows.length,
      data:{
        restaurants: results.rows,
      }
    });
    */
    res.status(200).json({
      status: "success",
      results: restaurantRatingsData.rows.length,
      data:{
        restaurants: restaurantRatingsData.rows,
      }
    });
  }catch(err){
    console.log(err.message);
  }
  
});
// ==================================================================


// you can make 2 api calls from frontend to the backend. but you can also combine it into 1 api
// app.get("/api/v1/restaurants/:id/reviews", () => {})


// ==================================================================
// cRud - GET    - retrieve one restaurant  - http://localhost:3001/api/v1/restaurants/:id
app.get("/api/v1/restaurants/:id", async(req, res) => {
  // you can change the variable name ":id" into something like ":restaurantid"
  try {
    console.log("rest api route handler = GET retireve one restaurant");
    // console.log(req.params);
    // ! template literals are vulnerable to SQL injections
    // const results = await db.query(`SELECT * FROM restaurants WHERE id = ${req.params.id}`);
    // Better use parameterized query
    
    // const restaurants_results = await db.query("SELECT * FROM restaurants WHERE id = $1", [req.params.id]);

    // more detailed that the one above, again to get rating information
    const restaurants_results = await db.query("SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id WHERE id = $1", [req.params.id]);

    // console.log(results.rows[0]); // rows[0] since there is only 1 row output

    // now, calling the reviews as well. GET all reviews from a restaurant
    const reviews_results = await db.query("SELECT * FROM reviews WHERE restaurant_id = $1", [req.params.id]);

    res.status(200).json({
      status: "success",
      data:{
        restaurant: restaurants_results.rows[0],
        reviews: reviews_results.rows
      }
    });
  }catch(err){
    console.log(err.message);
  }
});
// ==================================================================


// ==================================================================
// crUd - PUT    - update restaurant        - http://localhost:3001/api/v1/restaurants/:id
app.put("/api/v1/restaurants/:id", async(req, res) => { //the "params" from the SQL is obtained from the ":id" here
  try {
    console.log("rest api route handler = PUT update one restaurant");
    // console.log("id: " + req.params.id);
    // console.log(req.body);
    const results = await db.query("UPDATE restaurants SET name = $1, location = $2, price_range=  $3 WHERE id = $4 RETURNING *", [req.body.name, req.body.location, req.body.price_range, req.params.id]);
    // console.log(results.rows[0]);
    res.status(200).json({
      status: "success",
      data:{
        restaurant: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err.message);
  }
});
// ==================================================================


// ==================================================================
// cruD - DELETE - delete restaurant        - http://localhost:3001/api/v1/restaurants/:id
app.delete("/api/v1/restaurants/:id", async(req, res) => {
  try {
    console.log("rest api route handler = DELETE delete one restaurant");
    const results = await db.query("DELETE FROM restaurants WHERE id = $1 RETURNING *", [req.params.id]);
    // console.log(results.rows[0]);
    res.status(204).json({ //POSTMAN removes the json result because of the 204 status (204 = No Content)
      status: "success",
      data:{
        restaurant: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err.message);
  }
});
// ==================================================================



// ==================================================================
// Crud - Create - create review            - http://localhost:3001/api/v1/restaurants/:id/addReview
app.post("/api/v1/restaurants/:id/addReview", async (req, res) =>{
  try{
    const newReview = await db.query("INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) RETURNING * ;", [req.params.id, req.body.name, req.body.review, req.body.rating]);
    res.status(201).json({
      status: 'success',
      data: {
        review: newReview.rows[0],
      }
    });
  } catch (err) {
    console.log(err.message);
  }
})
// ==================================================================

app.use((req, res, next) => {
  console.log("middleware no.4 - your http request does not match any api routes");
  next(); // although no more routes/middlewares, still use next(); so that an error message can be given back
});


// const port = 3005
const port_number = process.env.PORT || 3006;
// uses the "PORT" variable from the .env file. "PORT" variable failed? default to 3006
app.listen(port_number, () =>{
  console.log(`server is up on port ${port_number}`)
});