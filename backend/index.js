import express from "express"
import adminRoutes from "./routes/admin.js"
import adminVendorsRoutes from "./routes/admin-vendors.js"
import userMessagesRoutes from "./routes/user-messages.js"
import referralsRoutes from "./routes/referrals.js"
import subscriptionsRoutes from "./routes/subscriptions.js"
import adminSubscriptionsRoutes from "./routes/admin-subscriptions.js"
import adminRolesRoutes from "./routes/admin-roles.js"
import adminSellersRoutes from "./routes/admin-sellers.js"

const app = express()

app.use("/api/admin", adminRoutes)
app.use("/api/admin/vendors", adminVendorsRoutes)
app.use("/api/admin/subscriptions", adminSubscriptionsRoutes)
app.use("/api/admin/roles", adminRolesRoutes)
app.use("/api/admin/sellers", adminSellersRoutes)
app.use("/api/user-messages", userMessagesRoutes)
app.use("/api/referrals", referralsRoutes)
app.use("/api/subscriptions", subscriptionsRoutes)
