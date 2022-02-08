const { channel } = require("diagnostics_channel");
const { config } = require("process");

const amqp = require("amqplib").connect(config.amqp);

const publishMessage = (payload) => {
  amqp
    .then(function (conn) {
      return conn
        .createChannel()
        .then(function (ch) {
          var ok = ch.assertQueue(config.queue, { durable: true });

          return ok.then(() => {
            ch.sendToQueue(config.queue, Buffer.from(JSON.stringify(payload)), {
              deliveryMode: true,
              persistent: true,
              contentType: "application/json",
            });
            console.log("Sent '%s'", payload);
            return ch.close();
          });
        })
        .finally(() => {
          conn.close();
        });
    })
    .catch(console.warn(error));
};

const sendMessage = () => {
  amqp
    .then((conn) => {
      return conn.createChannel().then((ch) => {
        var ok = ch.assertQueue(config.queue, { durable: true });
        ok = ok.then(function () {
          ch.prefetch(1);
        });
        ok = ok.then(() => {
          ch.consume(config.queue, doWork, { noAck: false });
          console.log(" [*] Waiting for messages.");
        });
        return ok;

        function doWork(data) {
          let message = JSON.parse(data.content.toString());

          transport
            .sendMail(message)
            .then((info) => {
              console.log("Delivered message %s", info.messageId);
              channel.ack(data);
            })
            .catch((err) => {
              console.warn(err);
              return channel.nack(data);
            });
        }
      });
    })
    .catch(console.warn(error));
};

// TODO: change later
s;
const transport = nodemailer.createTransport(
  {
    host: config.server.host,
    port: config.server.port,

    // we intentionally do not set any authentication
    // options here as we are going to use message specific
    // credentials

    // Security options to disallow using attachments from file or URL
    disableFileAccess: true,
    disableUrlAccess: true,
  },
  {
    // Default options for the message. Used if specific values are not set
    from: "sender@example.com",
  }
);
