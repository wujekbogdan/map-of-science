import { type FormEventHandler } from "react";
import styled from "styled-components";
import { FiltersBar } from "./Dropdown/Filters/FiltersBar.tsx";
import { SearchDropdown } from "./SearchDropdown.tsx";

export const Search = () => {
  const onFormSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <SearchDropdown filters={<FiltersBar />} />
    </Form>
  );
};

const Form = styled.form``;
