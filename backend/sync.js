sequelize.sync({ 
  alter: true, // Updates tables without dropping them
  logging: console.log
})
.then(() => {
  console.log('✅ Database schema updated successfully');
})
.catch(err => {
  console.error('❌ Database sync failed:', err);
});
