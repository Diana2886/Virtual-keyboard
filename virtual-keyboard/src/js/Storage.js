export function set(key, value) {
  window.localStorage.setItem(key, value);
}

export function get(key, subst = null) {
  return window.localStorage.getItem(key) || subst;
}

export function del(key) {
  localStorage.removeItem(key);
}
