const http = require('http');

exports.handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.open-notify.org',
      path: '/iss-now.json',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: 200,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      console.error('Error fetching ISS data:', error);
      reject({
        statusCode: 500,
        body: JSON.stringify({ error: 'An error occurred while fetching ISS data' })
      });
    });

    req.end();
  });
};
