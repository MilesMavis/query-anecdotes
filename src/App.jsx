/* eslint-disable react/react-in-jsx-scope */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReducer } from 'react';
import { getAnecdotes, createAnecdote, updateAnecdote } from './requests';
import NotificationContext from './NotificationContext';

import AnecdoteForm from './components/AnecdoteForm';
import Notification from './components/Notification';

const messageReducer = (state, action) => {
  switch (action.type) {
    case 'SET':
      return action.payload;
    case 'RESET':
      return null;
    default:
      return state;
  }
};

function App() {
  const [message, messageDispatch] = useReducer(messageReducer, null);

  const notificationTimeout = (newMessage) => {
    messageDispatch({ type: 'SET', payload: newMessage });
    setTimeout(() => {
      messageDispatch({ type: 'RESET' });
    }, '5000');
  };

  const queryClient = useQueryClient();
  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries('anecdotes');
      notificationTimeout(`you added ${newAnecdote.content}`);
      // const anecdotes = queryClient.getQueryData('anecdotes');
      // console.log(anecdotes); // prints undefined
      // queryClient.setQueryData('anecdotes', anecdotes.concat(newAnecdote));
    },
    onError: () => {
      notificationTimeout('too short anecdote; must have length of 5 or more');
    }
  });

  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: (updatedAnecdote) => {
      queryClient.invalidateQueries('anecdotes');
      notificationTimeout(`you voted ${updatedAnecdote.content}`);
    },
  });

  const handleVote = (anecdote) => {
    updateAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 });
  };

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecdotes,
    refetchOnWindowFocus: false,
  });

  console.log(JSON.parse(JSON.stringify(result)));

  if (result.isLoading) {
    return <div>loading data...</div>;
  } if (result.isError) {
    return <div>anecdote service not available due to problems in server</div>;
  }

  const anecdotes = result.data;

  return (
    <NotificationContext.Provider value={[message, messageDispatch]}>
      <div>
        <h3>Anecdote app</h3>
        <Notification />
        <AnecdoteForm newAnecdoteMutation={newAnecdoteMutation} />
        {anecdotes.map((anecdote) => (
          <div key={anecdote.id}>
            <div>
              {anecdote.content}
            </div>
            <div>
              has
              {' '}
              {anecdote.votes}
              <button type="button" onClick={() => handleVote(anecdote)}>vote</button>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export default App;
