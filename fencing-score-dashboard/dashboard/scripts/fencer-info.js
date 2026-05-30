const fencersReplicant = nodecg.Replicant('fencers');

// Input elements
const leftName = document.getElementById('left-name');
const leftPronouns = document.getElementById('left-pronouns');
const leftClub = document.getElementById('left-club');
const rightName = document.getElementById('right-name');
const rightPronouns = document.getElementById('right-pronouns');
const rightClub = document.getElementById('right-club');

// Buttons
const updateBtn = document.getElementById('update-btn');
const clearBtn = document.getElementById('clear-btn');
const status = document.getElementById('status');

const leftDropdown = document.getElementById('left-dropdown')
const rightDropdown = document.getElementById('right-dropdown')

// Don't want to add TS to this, but the format of these are as follows:
/*
{
    name: string,
    pronouns: string,
    club: string
}
    It is mapped in loadedFencers as "<name>^<pronouns>^<club>" as a signature to check that when updating fencers, we don't overload this selection option.
    The dropdown uses loadedFencersAry so that newer fencers are always set at the end of the dropdown list if they are new
*/
// If I had more time, I would probably make club and pronouns categories instead of freetext, but that's not important
let loadedFencers = {};
let loadedFencersAry = [];
const defLoad = '<option value="none">Fencer (BFC) -- Pronouns</option>'

// Adds a fencer to the database and add it to dropdown if applicable
function addLoadedFencer(data) {
    if(data.name === '' || data.club === '' || data.pronouns === '') return;
    const signature = `${data.name}^${data.pronouns}^${data.club}`
    const isNew = !Object.hasOwn(loadedFencers,signature)
    loadedFencers[signature] = data
    if(isNew) {
        loadedFencersAry.push(signature)
        const newOptions = defLoad + loadedFencersAry.map((fencer,idx) => `<option value="${idx}">${loadedFencers[fencer].name} (${loadedFencers[fencer].club}) -- ${loadedFencers[fencer].pronouns}</option>`).join("");
        leftDropdown.innerHTML = newOptions
        rightDropdown.innerHTML = newOptions
    }
}

// Load existing data when replicant changes
fencersReplicant.on('change', (newValue) => {
    if (newValue) {
        leftName.value = newValue.left?.name || '';
        leftPronouns.value = newValue.left?.pronouns || '';
        leftClub.value = newValue.left?.club || '';
        rightName.value = newValue.right?.name || '';
        rightPronouns.value = newValue.right?.pronouns || '';
        rightClub.value = newValue.right?.club || '';
    }
});

// Show status message
function showStatus(message, isError = false) {
    status.textContent = message;
    status.className = `status ${isError ? 'error' : 'success'}`;
    status.style.display = 'block';
    
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// Update fencer information
updateBtn.addEventListener('click', () => {
    try {
        const fencerData = {
            left: {
                name: leftName.value.trim(),
                pronouns: leftPronouns.value.trim(),
                club: leftClub.value.trim()
            },
            right: {
                name: rightName.value.trim(),
                pronouns: rightPronouns.value.trim(),
                club: rightClub.value.trim()
            }
        };
        // Add the fencers to the DB if necessary
        addLoadedFencer(fencerData.left)
        addLoadedFencer(fencerData.right)
        fencersReplicant.value = fencerData;
        showStatus('Fencer information updated successfully!');
    } catch (error) {
        console.error('Error updating fencer data:', error);
        showStatus('Error updating fencer information', true);
    }
});

// Clear all fields
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all fencer information?')) {
        try {
            const emptyData = {
                left: {
                    name: '',
                    pronouns: '',
                    club: ''
                },
                right: {
                    name: '',
                    pronouns: '',
                    club: ''
                }
            };

            fencersReplicant.value = emptyData;
            showStatus('All fencer information cleared');
        } catch (error) {
            console.error('Error clearing fencer data:', error);
            showStatus('Error clearing fencer information', true);
        }
    }
});


function applyDropdown(isLeft) {
    const name = (isLeft) ? leftName : rightName
    const pronouns = (isLeft) ? leftPronouns : rightPronouns
    const club = (isLeft) ? leftClub : rightClub
    return (event) => {
        const fencer = loadedFencers[loadedFencersAry[event.target.value]]
        if (event.target.value === 'none' || fencer == null) return
        name.value = fencer.name
        pronouns.value = fencer.pronouns
        club.value = fencer.club
    }
}

leftDropdown.addEventListener('change', applyDropdown(true))
rightDropdown.addEventListener('change', applyDropdown(false))