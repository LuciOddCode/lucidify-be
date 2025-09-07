"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const copingController_1 = require("../controllers/copingController");
const validation_3 = require("../middleware/validation");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/strategies', (0, validation_1.validateQuery)(validation_2.paginationSchema), copingController_1.getCopingStrategies);
router.get('/strategies/types', copingController_1.getCopingStrategyTypes);
router.get('/strategies/popular', copingController_1.getPopularStrategies);
router.get('/strategies/search', (0, validation_1.validateQuery)(validation_2.paginationSchema), copingController_1.searchCopingStrategies);
router.get('/strategies/type/:type', (0, validation_1.validateQuery)(validation_2.paginationSchema), copingController_1.getCopingStrategiesByType);
router.get('/strategies/stats', copingController_1.getCopingStrategyStats);
router.get('/suggestions', copingController_1.getPersonalizedSuggestions);
router.get('/:id', copingController_1.getCopingStrategy);
router.post('/:id/rate', (0, validation_1.validate)(validation_3.copingStrategyRateSchema), copingController_1.rateCopingStrategy);
exports.default = router;
//# sourceMappingURL=coping.js.map