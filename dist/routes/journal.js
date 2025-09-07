"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const journalController_1 = require("../controllers/journalController");
const validation_3 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.post('/create', (0, validation_1.validate)(validation_3.journalCreateSchema), journalController_1.createJournalEntry);
router.get('/entries', (0, validation_1.validateQuery)(validation_2.paginationSchema), journalController_1.getJournalEntries);
router.get('/analytics', journalController_1.getJournalAnalytics);
router.get('/insights', journalController_1.getJournalInsights);
router.get('/themes', journalController_1.getCommonThemes);
router.get('/sentiment', journalController_1.getSentimentDistribution);
router.get('/search', (0, validation_1.validateQuery)(validation_2.paginationSchema), journalController_1.searchJournalEntries);
router.get('/ai-prompt', journalController_1.getAIPrompt);
router.get('/:id', journalController_1.getJournalEntry);
router.put('/:id', (0, validation_1.validate)(validation_3.journalCreateSchema), journalController_1.updateJournalEntry);
router.delete('/:id', journalController_1.deleteJournalEntry);
exports.default = router;
//# sourceMappingURL=journal.js.map