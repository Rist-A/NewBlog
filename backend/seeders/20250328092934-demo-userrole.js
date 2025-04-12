'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_roles', [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        role_name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        role_name: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});

    console.log('UserRoles seeded');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_roles', null, {});
    console.log('UserRoles reverted');
  }
};
