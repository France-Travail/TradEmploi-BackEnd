import express from 'express';
import schema from './schema';
import resolvers from './resolvers';
import {ApolloServer} from 'apollo-server-express';
// import * as serviceAccount from "../credentials/credentials.json";

function gqlServer() {
  const app = express();
  const port: number = process.env.PORT ? +process.env.PORT : 8080;

  const apolloServer = new ApolloServer({
    context: async (/*{ req }*/) => {
        // const auth = req.headers && req.headers.authorization || '';
        // const key = Buffer.from(auth, 'base64').toString('ascii');
        // if(key !== serviceAccount.key)return { user: null };
        return { user: { id: 1, key: 'boguskey' /* !! TODO */ /* serviceAccount.key*/ } };
    },
    typeDefs: schema,
    resolvers,
    introspection: true,
    playground: true
  }) as any;

  apolloServer.applyMiddleware({app, path: '/', cors: true});
  // The `listen` method launches a web server.
  app.listen(port, '0.0.0.0');
  return app;
}

export default gqlServer;
