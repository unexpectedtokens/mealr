const config = {
  API_URL:
    process.env.MODE === "staging" || process.env.MODE === "production"
      ? "/"
      : "http://localhost:3000",
};

// http://localhost:8080
export default config;
