const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error fetching ISS data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An error occurred while fetching ISS data' })
    };
  }
};
