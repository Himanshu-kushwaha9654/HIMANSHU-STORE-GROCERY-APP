const url = 'https://api.quickcommerceapi.com/v1/search?q=milk&platform=BlinkIt&lat=12.90&lon=77.66';

fetch(url, {
  headers: {
    'X-API-Key': '9c94ce86-6594-441f-bf38-8bb73e2b9256'
  }
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
