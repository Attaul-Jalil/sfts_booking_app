require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const querystring = require('querystring');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const axios = require('axios'); // <-- Add this line
const bodyParser = require('body-parser');
const Message = require('./models/Message'); // Your Sequelize model
//const sequelize = require('./db'); // Your Sequelize instance



const app = express();




const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(express.json());
app.use(cors({ origin: '*' }));

// Temporary storage for verification codes
const verificationCodes = {};

// MySQL connection setup
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '12345',
    database: 'user_registration',
    port: 3306,
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        throw err;
    }
    console.log("Connected to MySQL database!");
});

// Sequelize connection for advanced admin functionalities
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: '127.0.0.1',
    dialect: 'mysql',
    port: 3306,
});

sequelize.authenticate()
    .then(() => console.log('Connected to the database with Sequelize'))
    .catch((err) => console.error("Sequelize connection error:", err));

// Define Sequelize models
const User = sequelize.define('User', {
    name: { type: Sequelize.STRING, allowNull: false },
    role: { type: Sequelize.ENUM('user', 'driver'), allowNull: false },
    status: { type: Sequelize.ENUM('active', 'inactive'), defaultValue: 'active' }
});

const Ride = sequelize.define('Ride', {
    date: { type: Sequelize.DATE, allowNull: false },
    status: { type: Sequelize.ENUM('pending', 'completed'), allowNull: false }
});

Ride.belongsTo(User, { as: 'user' });
Ride.belongsTo(User, { as: 'driver' });

sequelize.sync()
    .then(() => console.log('Models are synchronized with the database'))
    .catch((err) => console.error("Error syncing models:", err));

// User Signup Route
app.post("/signup", async (req, res) => {
    const { username, contact_number, email, password, confirmPassword } = req.body;

    if (!username || !contact_number || !email || !password || !confirmPassword) {
        return res.status(400).send("Please fill all fields.");
    }

    if (password !== confirmPassword) {
        return res.status(400).send("Passwords do not match.");
    }

    const checkUserSql = "SELECT * FROM users WHERE username = ? OR email = ? OR contact_number = ?";
    db.query(checkUserSql, [username, email, contact_number], (err, results) => {
        if (err) {
            console.error("Error checking user existence:", err);
            return res.status(500).send("Server error");
        }

        if (results.length > 0) {
            return res.status(409).send("Username, email, or contact number already exists.");
        }

        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error("Error hashing password:", hashErr);
                return res.status(500).send("Error during signup");
            }

            const sql = "INSERT INTO users (username, contact_number, email, password, role) VALUES (?, ?, ?, ?, ?)";
            db.query(sql, [username, contact_number, email, hashedPassword, 'user'], (insertErr, result) => {
                if (insertErr) {
                    console.error("Error inserting user into database:", insertErr);
                    return res.status(500).send("Error during signup");
                }

                return res.status(200).send("User registered successfully.");
            });
        });
    });
});

// Driver Signup Route
app.post("/DriverSignUp", async (req, res) => {
    const { username, contact_number, email, password, confirmPassword } = req.body;

    if (!username || !contact_number || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: "Please fill all fields." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const checkUserSql = "SELECT * FROM drivers WHERE username = ? OR email = ? OR contact_number = ?";
    db.query(checkUserSql, [username, email, contact_number], (err, results) => {
        if (err) {
            console.error("Error checking user existence:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: "Username, email, or contact number already exists." });
        }

        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error("Error hashing password:", hashErr);
                return res.status(500).json({ success: false, message: "Error during signup" });
            }

            const sql = "INSERT INTO drivers (username, contact_number, email, password) VALUES (?, ?, ?, ?)";
            db.query(sql, [username, contact_number, email, hashedPassword], (insertErr) => {
                if (insertErr) {
                    console.error("Error inserting driver:", insertErr);
                    return res.status(500).json({ success: false, message: "Error inserting driver" });
                }

                return res.status(200).json({
                    success: true,
                    message: "Driver registered successfully",
                });
            });
        });
    });
});

// Login endpoint for both users and drivers
app.post('/login', async (req, res) => {
    const { emailOrContact, password, role } = req.body;
  
    if (!emailOrContact || !password || !role) {
        return res.status(400).send('Please provide email/contact number, password, and role.');
    }
  
    const table = role === 'user' ? 'users' : 'drivers';
    
    const sql = `SELECT id, password, flag, role, status FROM ${table} WHERE email = ? OR contact_number = ?`;
    
    db.query(sql, [emailOrContact, emailOrContact], async (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            return res.status(500).json({ message: 'Server error' }); // Return JSON with message
        }
  
        if (results.length === 0) {
            return res.status(401).json({ message: 'User/Driver not found' }); // Return JSON with specific message
        }
  
        const user = results[0];
  
        // Check if the user's account is active
        if (user.status !== 'active') {
            return res.status(403).json({ message: 'Your account is inactive, please contact the admin.' }); // Return JSON with specific message
        }
  
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({
                success: true,
                message: 'Login successful',
                userId: user.id,
                flag: user.flag, // Include the flag in the response
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Incorrect password' }); // Return JSON with specific message
        }
    });
  });
// Endpoint to fetch user profile data
app.get('/api/Profile', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).send('User ID is required');
    }

    db.query('SELECT username, contact_number, email FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found');
        }

        res.json(results[0]);
    });
});

// PUT route to update user profile
app.put('/api/Profile', (req, res) => {
    const { userId, username, contact_number, email, password } = req.body;

    if (!userId || !username || !contact_number || !email) {
        return res.status(400).send({ success: false, message: 'All fields are required' });
    }

    const updateFields = { username, contact_number, email };
    if (password) {
        updateFields.password = bcrypt.hashSync(password, 10);
    }

    db.query('UPDATE users SET ? WHERE id = ?', [updateFields, userId], (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send({ success: false, message: 'Server error' });
        } else {
            res.status(200).send({ success: true, message: 'Profile updated successfully' });
        }
    });
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Route: Forgot Password
app.post('/forgot-password', async (req, res) => {
    const { contactNumber } = req.body;

    const sql = 'SELECT * FROM users WHERE contact_number = ?';
    db.query(sql, [contactNumber], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[contactNumber] = verificationCode;

        res.json({ success: true, verificationCode });
    });
});

// Send SMS Endpoint
app.post('/send-sms', (req, res) => {
    let { recipient, message } = req.body;

    if (!recipient.startsWith('92')) {
        recipient = `92${recipient.replace(/^0+/, '')}`;
    }

    const params = querystring.stringify({
        id: 'rchgulbergisb',
        pass: 'window2008',
        msg: message,
        to: recipient,
        mask: 'IBECHS',
        type: 'xml',
        lang: 'English',
    });

    const options = {
        hostname: 'www.outreach.pk',
        path: '/api/sendsms.php/sendsms/url',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(params),
        },
    };

    const smsReq = http.request(options, (smsRes) => {
        let responseData = '';

        smsRes.on('data', (chunk) => {
            responseData += chunk;
        });

        smsRes.on('end', () => {
            console.log("SMS Gateway Response:", responseData);
            res.json({ success: true, message: 'SMS sent successfully', gatewayResponse: responseData });
        });
    });

    smsReq.on('error', (e) => {
        console.error("Error sending SMS:", e);
        res.status(500).json({ success: false, message: 'Failed to send SMS', error: e.message });
    });

    smsReq.write(params);
    smsReq.end();
});

// Reset Password Endpoint
app.post('/reset-password', async (req, res) => {
    const { contactNumber, password, verificationCode } = req.body;

    if (!verificationCodes[contactNumber] || verificationCodes[contactNumber] !== verificationCode) {
        return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'UPDATE users SET password = ? WHERE contact_number = ?';
    db.query(sql, [hashedPassword, contactNumber], (err) => {
        if (err) {
            console.error("Error updating password:", err);
            return res.status(500).json({ success: false, message: 'Error updating password in database' });
        }

        delete verificationCodes[contactNumber];
        res.json({ success: true, message: 'Password reset successfully' });
    });
});

// POST route to handle vehicle registration
-app.post("/registerVehicle", (req, res) => {
  const { driverId, vehicleType, brand, model, vehicleNumber, year, color } = req.body;

  if (!driverId || !vehicleType || !brand || !model || !vehicleNumber || !year || !color) {
      return res.status(400).json({ success: false, message: "All fields are required." });
  }

  const sql = 'INSERT INTO vehicles (vehicle_type, brand, model, vehicle_number, year, color, driver_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [vehicleType, brand, model, vehicleNumber, year, color, driverId], (err, result) => {
      if (err) {
          console.error('Error inserting vehicle data:', err.message || err);
          return res.status(500).json({ success: false, message: 'Server error. Please check the logs for more details.' });
      }

      // Update the driver's flag to 1 after vehicle registration is successful
      const updateDriverFlagSql = 'UPDATE drivers SET flag = ? WHERE id = ?';
      db.query(updateDriverFlagSql, [1, driverId], (updateErr) => {
          if (updateErr) {
              console.error('Error updating driver flag:', updateErr.message || updateErr);
              return res.status(500).json({ success: false, message: 'Vehicle registered, but failed to update driver flag.' });
          }
      });

      res.status(201).json({ success: true, message: 'Vehicle registered successfully!' });
  });
});

// Fetch active users and drivers
app.get("/DashboardScreen/ActiveUsersAndDriversScreen", (req, res) => {
    // Query to fetch users and drivers separately but returns combined results
    const sql = `
     SELECT 'user' AS type, u.id AS userId, u.username, u.role, u.status, u.contact_number 
     AS driverContact FROM users u UNION ALL SELECT 'driver' AS type, d.id AS userId, d.username 
     AS username, d.role AS role, d.status AS status, d.contact_number AS driverContact FROM drivers d;
    `
  
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching active users and drivers:", err);
            return res.status(500).send("Server error");
        }
        res.status(200).json(results);
    });
  });

// Route to toggle account status for both users and drivers
app.patch("/DashboardScreen/manage-account/:role/:userId", (req, res) => {
  const role = req.params.role;  // either 'user' or 'driver'
  const userId = req.params.userId; 
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
  }

  // Determine the appropriate table
  const table = role === 'user' ? 'users' : role === 'driver' ? 'drivers' : null;

  if (!table) {
      return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const sql = `UPDATE ${table} SET status = ? WHERE id = ?`;

  db.query(sql, [status, userId], (err, result) => {
      if (err) {
          console.error(`Error updating ${role} status:`, err);
          return res.status(500).json({ success: false, message: `Failed to update ${role} status` });
      }

      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: `${role.charAt(0).toUpperCase() + role.slice(1)} not found` });
      }

      res.status(200).json({ success: true, message: `${role.charAt(0).toUpperCase() + role.slice(1)} status updated to ${status}` });
  });
});

// PATCH route to update driver account status
app.patch('/drivers/:driverId/status', (req, res) => {
  const driverId = req.params.driverId;
  const { status } = req.body;

  // Validate status input
  if (!status || (status !== 'active' && status !== 'inactive')) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const query = 'UPDATE drivers SET status = ? WHERE id = ?';
  db.query(query, [status, driverId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }

    res.json({ success: true, message: 'Driver status updated successfully' });
  });
});

// API to fetch driver information by driver ID
app.get('/users/:driverId', (req, res) => {
    const driverId = req.params.driverId;

    const query = 'SELECT id, username, contact_number, email FROM drivers WHERE id = ?';
    db.query(query, [driverId], (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        res.json(results[0]);
    });
});


 // Your Google Maps API Key
const GOOGLE_API_KEY = 'AIzaSyCqbKrepIG_BC1bzvzfWqRN3YrXawe-sOw'; // Use your API key

// Function to get coordinates from Google Geocoding API
const getCoordinates = async (address) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: GOOGLE_API_KEY, // Make sure you have set your Google API Key
            },
        });
        if (response.data.status === 'OK') {
            return response.data.results[0].geometry.location; // Returns lat and lng
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Error during geocoding:', error.message);
        throw error; // Propagate the error to be handled by the calling function
    }
};

// API to create a ride
app.post('/api/rides', async (req, res) => {
    const { pickUp, dropOff, UBID, userId } = req.body;

    // Validate input
    if (!pickUp || !dropOff || !userId) {
        return res.status(400).json({ success: false, message: 'Pickup, dropoff, and userId are required.' });
    }

    try {
        const pickupCoords = await getCoordinates(pickUp); // Geocode pickup address
        const dropoffCoords = await getCoordinates(dropOff); // Geocode dropoff address

        // Insert into the rides table with lat/lng
        db.query('INSERT INTO rides (UID, PickUp, DropOff, UBID, U_Bid_Id) VALUES (?, ?, ?, ?, ?)', 
            [userId, JSON.stringify(pickupCoords), JSON.stringify(dropoffCoords), UBID, 1], 
            (error, result) => {
                if (error) {
                    console.error('Error saving ride:', error);
                    return res.status(500).json({ success: false, message: 'Failed to create ride' });
                }
                res.status(201).json({ success: true, message: 'Ride created successfully', rideId: result.insertId });
            });
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
});



// Endpoint to place a driver bid
app.post('/api/rides/driverBid', (req, res) => {
    const { rideId, bidAmount, driverId } = req.body;

    // Validate inputs
    if (!rideId || !bidAmount || isNaN(bidAmount) || bidAmount <= 0 || !driverId) {
        return res.status(400).json({ success: false, message: 'All fields are required and the bid must be positive.' });
    }

    console.log(`Received bid - Ride ID: ${rideId}, Bid Amount: ${bidAmount}, Driver ID: ${driverId}`);

    // Update query to place the bid
    const updateQuery = `
      UPDATE rides
      SET D_Bid_Id = 1, DBID = ?, DID = ?
      WHERE RID = ? AND complete = 0 AND cancel = 0`;

    db.query(updateQuery, [bidAmount, driverId, rideId], (error, results) => {
        if (error) {
            console.error('Error updating ride record:', error);
            return res.status(500).json({ success: false, message: 'Failed to update the ride record.' });
        }

        if (results.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Bid placed successfully.' });
        } else {
            return res.status(404).json({ success: false, message: 'Ride not found, or the bid cannot be placed.' });
        }
    });
});

// Function to reverse geocode lat/lng to address
const reverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lng}`,
                key: process.env.GOOGLE_MAPS_API_KEY // Retrieves the API key from the .env file
            }
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            return response.data.results[0].formatted_address; // Return the formatted address
        }
    } catch (error) {
        console.error('Error during reverse geocoding:', error);
    }
    return null; // Return null if no address found
};

// ROute to show users rides to driver
app.get('/api/rides/bid', async (req, res) => {
    const query = `SELECT RID, UID, UBID, PickUp, DropOff FROM rides WHERE U_Bid_Id = 1 AND complete = 0 AND cancel = 0`;

    db.query(query, async (error, results) => {
        if (error) {
            console.error('Error fetching rides:', error);
            return res.status(500).json({ success: false, message: 'Failed to fetch rides' });
        }

        const ridesWithDataPromises = results.map(async (ride) => {
            const pickupCoords = JSON.parse(ride.PickUp);
            const dropoffCoords = JSON.parse(ride.DropOff);
            
            const pickupAddress = await reverseGeocode(pickupCoords.lat, pickupCoords.lng);
            const dropoffAddress = await reverseGeocode(dropoffCoords.lat, dropoffCoords.lng);

            return {
                ...ride,
                PickUp: pickupAddress,
                DropOff: dropoffAddress,
            };
        });

        const ridesWithParsedData = await Promise.all(ridesWithDataPromises);
        res.status(200).json({ success: true, rides: ridesWithParsedData });
    });
});



//Route for viewavailablerides screen when driverbidid=1
  app.get('/api/rides/d_bid/1', (req, res) => {
    const query = 'SELECT RID, UID, DBID, DID, Pickup AS Pickup, Dropoff AS Dropoff FROM rides WHERE D_Bid_Id = 1 AND complete = 0 AND cancel = 0';
    
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching rides:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch rides' });
      }
  
      const ridesWithData = results.filter(ride => ride.Pickup && ride.Dropoff);
  
      // If no rides found, send an empty array
      if (ridesWithData.length === 0) {
        return res.status(200).json({ success: true, rides: [] });
      }
  
      // Parse Pickup and Dropoff if they are strings (in case the data is stored as strings)
      const ridesWithParsedData = ridesWithData.map(ride => ({
        ...ride,
        Pickup: typeof ride.Pickup === 'string' ? JSON.parse(ride.Pickup) : ride.Pickup,
        Dropoff: typeof ride.Dropoff === 'string' ? JSON.parse(ride.Dropoff) : ride.Dropoff
      }));
  
      res.status(200).json({ success: true, rides: ridesWithParsedData });
    });
  });



  // Sample data structure to represent ride requests
let rides = [
    { RID: 1, DID: 101, DBID: 50, Pickup: { lat: 34.0522, lng: -118.2437 }, Dropoff: { lat: 34.0522, lng: -118.2437 }, accepted: 0 },
    { RID: 2, DID: 102, DBID: 75, Pickup: { lat: 34.0522, lng: -118.2437 }, Dropoff: { lat: 34.0522, lng: -118.2437 }, accepted: 0 },
  ];
  
  // Endpoint to accept a ride
  app.post('/api/rides/accept', (req, res) => {
    const { rideId } = req.body;
  
    // Find the ride by RID
    const ride = rides.find(r => r.RID === rideId);
  
    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found' });
    }
  
    // Update the ride status to accepted
    ride.accepted = 1; // Set accepted to 1
    return res.json({ success: true, message: 'Ride accepted successfully' });
  });
  
  // Sample endpoint to get rides
  app.get('/api/rides/d_bid/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const filteredRides = rides.filter(ride => ride.DBID === id);
    res.json({ success: true, rides: filteredRides });
  });

  

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });
  
  sequelize.sync(); // Synchronize models with the database
  
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('joinRoom', async (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
      
      const messages = await fetchMessages(room);
      socket.emit('loadMessages', messages);
    });
  
    socket.on('sendMessage', async ({ room, message }) => {
      console.log('Message received:', message);
      try {
        await saveMessage({ ...message, room });
        io.to(room).emit('receiveMessage', message);
      } catch (error) {
        console.error('Error saving message to database:', error);
      }
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  
  const saveMessage = async (message) => {
    try {
      await Message.create({
        text: message.text,
        user_id: message.user._id,
        room: message.room,
        created_at: new Date(message.createdAt),
      });
      console.log('Message saved to database');
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  };
  
  const fetchMessages = async (room) => {
    try {
      return await Message.findAll({
        where: { room },
        order: [['created_at', 'DESC']],
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  };

server.listen(PORT, () => {
    console.log(`Server running on http://192.168.194.148:${PORT}`);
});