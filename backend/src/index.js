const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const { requireAdmin, adminLogin, adminLogout } = require('./middleware/adminAuth');

const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const bookingsRoutes = require('./routes/bookings');
const offersRoutes = require('./routes/offers');

const { createRequestId } = require('./middleware/requestId');
const { errorHandler } = require('./middleware/errorHandler');

// Ensure admin cookie can be read on subsequent requests.
// (Used by requireAdmin)


const app = express();

app.use(createRequestId());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

// Public APIs
app.use('/api/public', publicRoutes);

// Admin APIs (admin-only)
app.use('/api/admin', requireAdmin, adminRoutes);
app.use('/api/products', requireAdmin, productRoutes);
app.use('/api/orders', requireAdmin, orderRoutes);
app.use('/api/bookings', requireAdmin, bookingsRoutes);
app.use('/api/offers', requireAdmin, offersRoutes);

// Admin login/logout (separate from protected routes)
app.post('/api/admin/login', adminLogin);
app.post('/api/admin/logout', adminLogout);

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});

