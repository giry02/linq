(() => {
  if (window.__linqFinalConfigLoaded) return;
  window.__linqFinalConfigLoaded = true;

  const path = location.pathname;
  const routeMap = [
    ['/srvc/equipError/', 'service-errors'],
    ['/srvc/maintenance/', 'maintenance-history'],
    ['/srvc/supplies/', 'supplies-management'],
    ['/srvc/list/', 'service-overview'],
    ['/anlz/operate/', 'operation-efficiency'],
    ['/anlz/shock/', 'operation-shock'],
    ['/anlz/fuel/', 'engine-efficiency'],
    ['/anlz/battery/li/', 'lithium-battery'],
    ['/equip/list/', 'home-vehicles'],
    ['/dashboard/', 'dashboard'],
  ];

  window.LINQ_FINAL_IMPLEMENTATION = true;
  window.LINQ_REVIEW_SCREEN = routeMap.find(([route]) => path.includes(route))?.[1] || '';
  document.documentElement.classList.add('linq-final-implementation');
})();
