const config = require("./config");
const nodemailer = require("nodemailer");
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
    .catch((error) => {
      console.log(error);
    });
};

const sendMessage = () => {
  amqp
    .then((conn) => {
      return conn.createChannel().then((ch) => {
        var ok = ch.assertQueue(config.queue, { durable: true });
        ok = ok.then(() => {
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
              ch.ack(data);
            })
            .catch((err) => {
              console.warn(err);
              return ch.nack(data);
            });
        }
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

const transport = nodemailer.createTransport({
  host: config.server.host,
  port: config.server.port,

  auth: {
    user: config.server.user,
    pass: config.server.password,
  },
});

module.exports = {
  publishMessage,
  sendMessage,
};

require("make-runnable");
