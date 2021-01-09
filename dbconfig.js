module.exports = {
  user          : process.env.NODE_ORACLEDB_USER || "c##skander",
  password      : process.env.NODE_ORACLEDB_PASSWORD||"skander123",
  connectString : process.env.NODE_ORACLEDB_CONNECTIONSTRING || "XE",
  externalAuth  : process.env.NODE_ORACLEDB_EXTERNALAUTH ? true : false
};