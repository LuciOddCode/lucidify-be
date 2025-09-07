"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const moodController_1 = require("../controllers/moodController");
const validation_3 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/log', (0, validation_1.validate)(validation_3.moodLogSchema), moodController_1.logMood);
router.get('/entries', (0, validation_1.validateQuery)(validation_2.paginationSchema), moodController_1.getMoodEntries);
router.get('/analytics', moodController_1.getMoodAnalytics);
router.get('/insights', moodController_1.getMoodInsights);
router.get('/trends', moodController_1.getMoodTrends);
router.get('/emotions', moodController_1.getEmotionFrequency);
router.get('/:id', moodController_1.getMoodEntry);
router.put('/:id', (0, validation_1.validate)(validation_3.moodLogSchema), moodController_1.updateMoodEntry);
router.delete('/:id', moodController_1.deleteMoodEntry);
exports.default = router;
//# sourceMappingURL=mood.js.map