export const setRTL = (isRTL: boolean) => {
  // Set document direction
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  
  // Add/remove RTL class from body for global styles
  if (isRTL) {
    document.body.classList.add('rtl');
  } else {
    document.body.classList.remove('rtl');
  }
};
