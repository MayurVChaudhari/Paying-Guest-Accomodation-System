const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const app = express();
const connectionstring = "mongodb://127.0.0.1:27017";

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("../public"));

// Database Connection Helper Function
async function connectToMongoDB() {
  const client = new MongoClient(connectionstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    
    return client.db("PGAS");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}



app.post("/requests/:id", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const owner = req.query.OwnerId;
    const reqUserId = req.params.id;
    const state = req.query.state;
    const userIdObjectId = new ObjectId(reqUserId);

    if (state === "true") {
      // Update owner document and fetch the updated document
      const ownerUpdateResult = await db.collection("Owners").updateOne(
        { UserName: owner },
        {
          $pull: { "forms.req": userIdObjectId },
          $addToSet: { "forms.customers": reqUserId },
        }
      );

      // Get the updated owner document's _id
      const updatedOwner = await db.collection("Owners").findOne({ UserName: owner });
     
      if (updatedOwner) {
        const ownerId = updatedOwner._id;
        console.log(ownerId);

        // Update user document with the ownerId
        await db.collection("Users").updateOne(
          { _id: userIdObjectId },
          {
            $addToSet: { "bookedPgs": ownerId },
          }
        );
      } else {
        console.log("Owner not found");
      }
    } else {
      // Handle state false case
      const result = await db.collection("Owners").updateOne(
        { UserName: owner },
        { $pull: { "forms.req": userIdObjectId } }
      );
    }

    res.status(200).json({
      message: "Request processed successfully",
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Failed to process request");
  }
});

app.get("/requests", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const userName = req.body.userName;
    
    const user = await db.collection("Owners").findOne({ UserName: userName });

    if (!user) {
      return res.status(404).send("User not found");
    }

    console.log(user);
    const reqs = user.forms.req || [];

    let data = [];
    const promises = reqs.map((ele) => {
      return db.collection("Users").findOne({ _id: ele });
    });

    await Promise.all(promises)
      .then((results) => {
        data = results.map((ele) => {
          ele.Password = null;
          return ele;
        });
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });

    res.status(200).json({
      data,
    });

    console.log(data);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send("Failed to process request");
  }
});

app.post("/registeruser", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const data = {
      UserName: req.body.UserName,
      Password: req.body.Password,
      Mobile: req.body.Mobile,
      Email: req.body.Email,
    };
    const result = await db.collection("Users").insertOne(data);
    console.log("Record Inserted");
    res.send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Failed to register user");
  }
});

app.get("/getusers", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const Users= await db.collection("Users").find({}).toArray();
    res.send(Users);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).send("Failed to fetch owners");
  }
});

app.get("/getadmin", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const admins = await db.collection("Admin").find({}).toArray();
    res.send(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).send("Failed to fetch admins");
  }
});

app.get("/getOwners", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const owners = await db.collection("Owners").find({}).toArray();
    res.send(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).send("Failed to fetch owners");
  }
});

app.post("/registerOwner", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const data = {
      UserName: req.body.UserName,
      Password: req.body.Password,
      Mobile: req.body.Mobile,
      Email: req.body.Email,
    };
    const result = await db.collection("Owners").insertOne(data);
    console.log("Record Inserted");
    res.send("Owner registered successfully");
  } catch (error) {
    console.error("Error registering owner:", error);
    res.status(500).send("Failed to register owner");
  }
});

app.post("/submitform", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const formdata = {
      PgName: req.body.PgName,
      PgType: req.body.typepg,
      Location: req.body.Location,
      RPmonth: req.body.RPmonth,
      Rooms: req.body.Rooms,
      Address: req.body.Address,
      Roomimage: req.body.Roomimage,
      Electricity: req.body.Electricity,
      Parking: req.body.Parking,
      Refregerator: req.body.Refregerator,
      Furnished: req.body.Furnished,
      Ac: req.body.Ac,
      Balcony: req.body.Balcony,
      Table: req.body.Table,
      Laundry: req.body.Laundry,
      Security: req.body.Security,
      Meals: req.body.checkbox,
    };
    const OwnerName = req.body.OwnerName;
    const result = await db
      .collection("Owners")
      .updateOne({ UserName: OwnerName }, { $set: { forms: formdata } });
    console.log("Record updated");
    res.send("Form submitted successfully");
  } catch (error) {
    console.error("Error submitting form:", error);
    res.status(500).send("Failed to submit form");
  }
});


app.get("/getpgdetails", async (req, res) => {
  try {
   
    const db = await connectToMongoDB();
    const pgDetails = await db.collection("Owners").find({}).toArray();
    res.send(pgDetails);
   
  } catch (error) {
    console.error("Error fetching pg details:", error);
    res.status(500).send("Failed to fetch pg details");
  }
});

app.get("/getpgbookingdetails",async (req, res) => {
  try {
    
    const db = await connectToMongoDB();

    // Get owner's username from the cookie (assuming it's stored as "ownerId")
    // const ownerUserName =req.headers['OwnerId'];
    const ownerUserName = req.query.ownerId;

    // Replace this with actual retrieval from cookies

    // Find the owner document based on the username
    const owner = await db.collection("Owners").findOne({ UserName: ownerUserName });

    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Check if forms and req exist in the owner document
    if (!owner.forms || !owner.forms.req || !Array.isArray(owner.forms.req)) 
    {
      return res.status(404).json({ message: "Booking details not found for this owner" });
    }

    // Retrieve req array IDs for the current owner
    const reqIds = owner.forms.req.map(id => new ObjectId(id));

    // Fetch detailed information for each req ID
    const detailedBookings = [];
    for (const reqId of reqIds) {
     
      const booking = await db.collection("Users").findOne({ _id: reqId });
      
      if (booking) {
        detailedBookings.push({
          requestId: booking._id.toString(),
          UserName: booking.UserName,
          Mobile:booking.Mobile,
          Email:booking.Email// Assuming the booking object has a 'details' field
          // Add other fields as needed
        });
      }
    }

    res.status(200).json({
      bookings: detailedBookings
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).send("Failed to fetch booking details");
  }
});


const userSchema = new mongoose.Schema({
  UserName: String,
  Password: String,
  Mobile: String,
  Email: String,
  forms: {
    PgName: String,
    PgType: String,
    Location: String,
    RPmonth: String,
    Rooms: String,
    Address: String,
    Roomimage: String,
    Electricity: String,
    Parking: String,
    Refregerator: String,
    Furnished: String,
    Ac: String,
    Balcony: String,
    Table: String,
    Laundry: String,
    Security: String,
    Meals: String
  }
});

const User1 = mongoose.model('User1', userSchema);

app.post('/deleteForm', async (req, res) => {
  const ownerId = req.body.OwnerId;

  try {
    // Check if ownerId is a valid ObjectId
    if (!ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: 'Invalid ownerId' });
    }

    // Convert ownerId to a valid ObjectId
   

    // Use the converted ObjectId to find and update the user document
    const user = await User1.findOneAndUpdate(
      { UserName:ownerId },
      { $unset: { forms: '' } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Form deleted successfully', user });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = app;

const User = mongoose.model('User', {
  id: String,
  UserName: String,
  Password: String,
  Mobile: String,
  Email: String
});

// Express route to handle form submission
app.post('/BookPg', async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const pgName = req.body.pgName;
    const userName = req.body.userName;

    // Find the user by username
    const user = await db.collection('Users').findOne({ UserName: userName });

    if (!user) {
      return res.status(404).send('User not found');
    }

    console.log('User ID:', user._id);
    console.log('PgName:', pgName);
    console.log('UserName:', userName);
 
    // const username="omkar";
    // Update the Owners document to add the user ID to forms.req array
    const result = await db.collection('Owners').updateOne(
      {  "forms.PgName": pgName},
      {
        $addToSet: { "forms.req": user._id }
       }
    );

    console.log('Modified Count:', result.modifiedCount);

    if (result.modifiedCount === 1) {
      res.status(200).send('Booked successfully');
    } else {
      res.status(404).send('PgName not found or no changes applied');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to submit form');
  }
});

app.get("/getpgbooked",async (req, res) => {
  try {
    
    
    const db = await connectToMongoDB();
    const username = req.query.UserId;
    const user = await db.collection("Users").findOne({ UserName: username });
    console.log(username);

    if (!user) {
      return res.status(404).json({ message: "Owner not found" });
    }

    if (!user.bookedPgs || !Array.isArray(user.bookedPgs)) 
    {
      return res.status(404).json({ message: "Booking details not found for this owner" });
    }

    const reqIds = user.bookedPgs.map(id => new ObjectId(id));

    const detailedBookings = [];
    for (const reqId of reqIds) {
      
      console.log(reqId);
      const booking = await db.collection("Owners").findOne({ _id: reqId });
      
      if (booking) {

        detailedBookings.push({
          requestId: booking._id.toString(),
          PgName: booking.forms.PgName,
          Address:booking.forms.Address,
          Location:booking.forms.Location,
          Rent:booking.forms.RPmonth,
          
        });
      }
      
    }

    res.status(200).json({
      bookings: detailedBookings
    });
  } catch (error) {
    console.error("Error fetching booking details:", error);
    res.status(500).send("Failed to fetch booking details");
  }
});

// Start the server
const PORT = 4400;
app.listen(PORT, () => {
  console.log(`Server started on http://127.0.0.1:${PORT}`);
});
