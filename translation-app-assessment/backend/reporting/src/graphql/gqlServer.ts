import express from 'express';
import schema from './schema';
import resolvers from './resolverFunctions';
import {ApolloServer} from 'apollo-server-express';

function gqlServer() {
  const app = express();
  const port: number = process.env.PORT ? +process.env.PORT : 8080;

  const apolloServer = new ApolloServer({
    context: async () => {
        return { user: { id: 1, key: 'boguskey'  } };
    },
    typeDefs: schema,
    resolvers,
    introspection: true,
    playground: true
  }) as any;

  apolloServer.applyMiddleware({app, path: '/', cors: true});
  app.listen(port, '0.0.0.0');
  return app;
}

export default gqlServer;
