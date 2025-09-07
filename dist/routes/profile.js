"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const profileController_1 = require("../controllers/profileController");
const validation_2 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', profileController_1.getProfile);
router.put('/', (0, validation_1.validate)(validation_2.profileUpdateSchema), profileController_1.updateProfile);
router.get('/dashboard', profileController_1.getDashboard);
router.get('/stats', profileController_1.getUserStats);
router.get('/activity', profileController_1.getActivitySummary);
router.get('/goals', profileController_1.getGoals);
router.put('/goals/:goalId', profileController_1.updateGoal);
router.put('/preferences', profileController_1.updatePreferences);
router.post('/trusted-contact', (0, validation_1.validate)(validation_2.trustedContactSchema), profileController_1.setTrustedContact);
router.post('/trusted-contact/test', profileController_1.testTrustedContact);
router.get('/export', profileController_1.exportData);
router.delete('/account', profileController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=profile.js.map