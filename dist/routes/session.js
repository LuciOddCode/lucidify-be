"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const sessionController_1 = require("../controllers/sessionController");
const validation_3 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/start', sessionController_1.startSession);
router.get('/templates', sessionController_1.getSessionTemplates);
router.get('/analytics', sessionController_1.getSessionAnalytics);
router.get('/insights', sessionController_1.getSessionInsights);
router.get('/user-sessions', (0, validation_1.validateQuery)(validation_2.paginationSchema), sessionController_1.getUserSessions);
router.get('/:id', sessionController_1.getSession);
router.put('/:id/step/:stepId', (0, validation_1.validate)(validation_3.sessionStepUpdateSchema), sessionController_1.updateStep);
router.post('/:id/complete', (0, validation_1.validate)(validation_3.sessionCompleteSchema), sessionController_1.completeSession);
exports.default = router;
//# sourceMappingURL=session.js.map