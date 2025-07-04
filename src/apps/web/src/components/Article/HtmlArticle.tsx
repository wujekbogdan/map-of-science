import styled from "styled-components";

type Props = {
  html: string;
};

export const HtmlArticle = ({ html }: Props) => {
  return (
    <>
      {
        // It says dangerouslySetInnerHTML, but it's safe because the content comes
        // from local markdown files we control.
      }
      {html && <Article dangerouslySetInnerHTML={{ __html: html }} />}
    </>
  );
};

export default HtmlArticle;

// TODO: Implement proper styling for Markdown content.
// https://github.com/wujekbogdan/map-of-science/issues/58
const Article = styled.div`
  line-height: 1.42;
`;
