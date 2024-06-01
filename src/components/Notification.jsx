/* eslint-disable react/react-in-jsx-scope */
import { useContext } from 'react';
import NotificationContext from '../NotificationContext';


function Notification() {
  const [message, messageDispatch] = useContext(NotificationContext);

  const style = {
    border: 'solid',
    padding: 10,
    borderWidth: 1,
    marginBottom: 5,
  };

  if (!message) return null;

  return (
    <div style={style}>
      {message}
    </div>
  );
}

export default Notification;
