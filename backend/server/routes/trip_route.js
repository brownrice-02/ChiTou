const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip_controller');
const userController = require('../controllers/user_controller');

router.post('/', userController.authorization, tripController.createTrip);
router.get('/', userController.authorization, tripController.getTrips);

module.exports = router;