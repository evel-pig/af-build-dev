const config = {
  'GET /api/system/test': {
    name: 'mary',
    age: 12344,
  },
  'POST /system/login': {
    status: 0,
    token: '123',
    userId: 123,
  },
  '/api/(.*)': 'http://192.168.102.100:16000/chqa',
}

module.exports = config;
