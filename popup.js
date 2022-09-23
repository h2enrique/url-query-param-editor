const submitQuery = document.getElementById('submitQuery');
const parameters = document.getElementById('params');
const copyAsObject = document.getElementById('copyAsObject');

const displayQueryBreakdown = (url) => {
    // separate query from url
    const queryParams = url.split('?')[1]; 

    const setupInput = (key, value) => {
        const queryParam = document.createElement('div');
        queryParam.setAttribute('class', 'queryParam');

        const toggleParameter = document.createElement('input');
        const keyParam = document.createElement('input');
        const valueParam = document.createElement('input');

        toggleParameter.setAttribute('type', 'checkbox');
        toggleParameter.setAttribute('class', 'toggleParameter');
        keyParam.setAttribute('id', 'paramKey');
        keyParam.setAttribute('class', 'inputParam');
        valueParam.setAttribute('id', 'paramValue');
        valueParam.setAttribute('class', 'inputParam');

        if (key && value) {
            keyParam.value = key;
            valueParam.value = value;
        }

        const equals = document.createElement('span');
        equals.setAttribute('style', 'color: white;');
        equals.textContent = ' = ';

        queryParam.appendChild(toggleParameter);
        queryParam.appendChild(keyParam);
        queryParam.appendChild(equals);
        queryParam.appendChild(valueParam);

        parameters.appendChild(queryParam);

        toggleParameter.addEventListener('change', e => {
            if (e.target.checked) {
                keyParam.disabled = true;                        
                valueParam.disabled = true;                        
            }
            else {
                keyParam.disabled = false;                        
                valueParam.disabled = false;                        
            } 
        });
    };

    //  then create breakdown list of all parameters in query 
    if (!queryParams) {
        setupInput();
    }
    else {
        queryParams.split('&').forEach(query => {
            const [key, value] = query.split(/=(.+)/g);

            setupInput(key, value);
        });
    }

};

/*
const clearQuery = () => {
    while (parameters.firstChild) {
        parameters.removeChild(parameters.lastChild);
    }
}
*/

const displayAsObject = (keys, values) => {
    const result = {};

    keys.map((key, index) => {
        result[key] = values[index];
    });

    return JSON.stringify(result);
};


// Submit Query btn Listener
submitQuery.addEventListener('click', () => {
    const queryParam = document.querySelectorAll('.queryParam');  

    let newQuery = '';

    queryParam.forEach((parameter) => {
        const paramKey = parameter.querySelector('#paramKey');
        const paramValue = parameter.querySelector('#paramValue');

        if (paramKey.value && paramValue.value && !paramKey.disabled && !paramValue.disabled) {
            newQuery += newQuery[0] === '?' ? '&' : '?';
            newQuery += `${paramKey.value}=${paramValue.value}`;
        }
    });
    
    chrome.tabs.query({active: true, currentWindow: true})
        .then(currTab => currTab[0].url)
        .then(url => {
            const newUrl = url.split('?')[0] + newQuery;

            chrome.tabs.update({url: newUrl})
        });
});


// Copy as object btn Listener
copyAsObject.addEventListener('click', () => {
    const queryParam = document.querySelectorAll('.queryParam');  

    const paramKeys = [];
    const paramValues = [];

    queryParam.forEach(query => {
        const paramKey = query.querySelector('#paramKey');
        const paramValue = query.querySelector('#paramValue');

        if (!paramKey.disabled && !paramValue.disabled) {
            paramKeys.push(paramKey.value);
            paramValues.push(paramValue.value);
        }
    });

    const currQuery = displayAsObject(paramKeys, paramValues);

    navigator.clipboard.writeText(currQuery)
        .then(() => alert('query params copied to clipboard!'));
});


// Render dynamic page
// Used chrome extension api to get current tab url
chrome.tabs.query({ active: true, currentWindow: true})
    .then(tabUrl => displayQueryBreakdown(tabUrl[0].url))
