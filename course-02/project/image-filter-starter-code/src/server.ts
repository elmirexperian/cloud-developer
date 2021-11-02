import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

interface ResponseError extends Error {
  status?: number;
}

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  app.get("/filteredimage", async (req, res) => {
      let { image_url } = req.query;

      if (!image_url) {
        return res.status(400)
          .send(`image_url is required`);
      }

    const filteredPath = await filterImageFromURL(image_url);

    var options = {
      // root: __dirname
    };

    res.sendFile(filteredPath, options, function (err) {
      if (err) {
        res.status((<ResponseError>err).status || 500).end();
      } else {
        deleteLocalFiles([filteredPath]);
      }
    });

  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();