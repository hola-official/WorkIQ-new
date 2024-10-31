const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { protectedRoute } = require('../middleware/protectedRoute');

router.post('/', protectedRoute, portfolioController.createPortfolio);
router.put('/:portfolioId', protectedRoute, portfolioController.updatePortfolio);
router.delete('/:portfolioId', protectedRoute, portfolioController.deletePortfolio);
router.get('/', protectedRoute, portfolioController.getAllPortfolios);

module.exports = router;
