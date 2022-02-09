import { publishMessage } from "./emailWorker";

var message = {
  from: "potatowebservice@gmail.com",
  to: "ziqing.zhou@duke.edu",
  subject: "Message title",
  text: "Plaintext version of the message",
  html: "<p>HTML version of the message</p>",
};

publishMessage(message);
