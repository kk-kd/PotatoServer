

export const CheckStudentCell = (col, val) => {
    if (col === 'index' || col === 'valid') {
        return true
    }
    // 
    else if (val) {
        return true;
    }
    else {
        return false;
    }
    
} 

export const CheckParentCell = (col, val) => {
    
} 

export const CheckStudentRow = (row) => {
    console.log(row)
    
    for (const [key, value] of Object.entries(row)) {
        if (!CheckStudentCell(key, value)) {
            console.log(key, value)
            return false
        }
    }  
    return true; 
} 

export const CheckParentRow = (row) => {
    
} 