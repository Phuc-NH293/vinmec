export function ArticleContent({ content }: { content: string }) {
  const blocks = content.split("\n\n").filter(Boolean);
  return (
    <div className="article-content">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) {
          return <h2 key={index}>{block.replace("## ", "")}</h2>;
        }
        if (block.startsWith("### ")) {
          return <h3 key={index}>{block.replace("### ", "")}</h3>;
        }
        if (block.startsWith("- ")) {
          return (
            <ul key={index}>
              {block.split("\n").map((item) => (
                <li key={item}>{item.replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}
