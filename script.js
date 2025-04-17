function showSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'flex'
  }
  function hideSidebar(){
    const sidebar = document.querySelector('.sidebar')
    sidebar.style.display = 'none'
  }

  const filterButtons = document.querySelectorAll('.filter-button');
  const projectBoxes = document.querySelectorAll('.forthSection .cantainer .box');
  
  // Initially hide all boxes except ETL
  projectBoxes.forEach(box => {
      if (!box.classList.contains('etl')) {
          box.style.display = 'none';
      }
  });
  
  filterButtons.forEach(button => {
      button.addEventListener('click', () => {
          const category = button.dataset.category;
  
          projectBoxes.forEach(box => {
              if (category === 'all' || box.classList.contains(category)) {
                  box.style.display = 'block';
              } else {
                  box.style.display = 'none';
              }
          });
      });
  });
