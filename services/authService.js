import { supabase } from '../src/lib/config/supabase.js';

// Register a new user with email and password
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

// Log in an existing user
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.user;
}

// Log out the current user
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// Get the current logged-in user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}