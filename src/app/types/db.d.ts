interface User {
  sub: string;
  name: string;
  email: string;
  image: string;
}

// interface Message {
//   id: string;
//   senderId: string;
//   receiverId: string;
//   text: string;
//   timestamp: number;
// }

interface Chat {
  id: string;
  message: Message[];
}

interface RUser {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
}
