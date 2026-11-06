const axios = require("axios");

const AI_SERVICE_URL = "http://127.0.0.1:8000";

const predictDelivery = async (data) => {
    const response = await axios.post(
        `${AI_SERVICE_URL}/predict-delivery`,
        data
    );

    return response.data;
};

const predictDelay = async (data) => {
    const response = await axios.post(
        `${AI_SERVICE_URL}/predict-delay`,
        data
    );

    return response.data;
};

const explainDelivery = async (data) => {
    const response = await axios.post(
        `${AI_SERVICE_URL}/explain-delivery`,
        data
    );

    return response.data;
};


module.exports = {
    predictDelivery,
    predictDelay,
    explainDelivery
};