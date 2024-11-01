"use client";

import { SearchBar as UISearchBar, SearchBarProps, StoryBook, useControls, useCreateStore } from '@lobehub/ui';

const SearchBar = ({onSearch}) => {  // Fixed function declaration
  const store = useCreateStore();
  const controls: SearchBarProps | any = useControls(
    {
      enableShortKey: true,
      loading: false,
      placeholder: 'Type keywords...',
      shortKey: 'f',
      spotlight: false,
      type: {
        options: ['ghost', 'block'],
        value: 'ghost',
      },
    },
    { store },
  );

  return (
    <>
      <UISearchBar onInput={(e) =>{onSearch(e.currentTarget.value)}} />  
  <div style={{height:20}}/>
      </>
   
  );
};

export default SearchBar;
