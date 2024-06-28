import { memo, useEffect } from "react";
import { useAtom } from "jotai";
import { useDebouncedCallback } from "@react-hookz/web";
import { NodeRendererProps, Tree } from "react-arborist";
import { treeDSBlocks } from "../../../../../atoms/blocks.ts";
import { cn } from "../../../../../functions/Functions.ts";
import {
  useBuilderProp,
  useHighlightBlockId,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../../../hooks";
import { TriangleRightIcon } from "@radix-ui/react-icons";
import { ScrollArea, Tooltip, TooltipContent, TooltipTrigger } from "../../../../../../ui";
import { TypeIcon } from "../TypeIcon.tsx";
import { DefaultCursor } from "./DefaultCursor.tsx";
import { DefaultDragPreview } from "./DefaultDragPreview.tsx";
import { useBlocksStoreUndoableActions } from "../../../../../history/useBlocksStoreUndoableActions.ts";
import { BlockContextMenu } from "../BlockContextMenu.tsx";
import { canDropBlock } from "../../../../../functions/block-helpers.ts";

const Node = memo(({ node, style, dragHandle, tree }: NodeRendererProps<any>) => {
  const outlineItems = useBuilderProp("outlineMenuItems", []);
  const [, setHighlighted] = useHighlightBlockId();

  const isDropAllowed = tree.props.disableDrop;

  const hasChildren = node.children.length > 0;

  const { id, data, isSelected, willReceiveDrop, isDragging, isEditing, handleClick } = node;

  const debouncedSetHighlighted = useDebouncedCallback((id) => setHighlighted(id), [], 300);

  const handleToggle = (event: any) => {
    event.stopPropagation();
    /*Toggle the node open and close State*/
    node.toggle();
  };

  const handleNodeClickWithoutPropagating = (e: any) => {
    /**
     * To stop propagation of the event to the parent
     * Tree Component to avoid clearing the selection of blocks
     * and allowing to select current block.
     */
    e.stopPropagation();
    /**
     * It will work when a node is clicked.
     * The onSelect in the parent Tree Component
     * will also trigger the selection of the node.
     */
    handleClick(e);
  };

  useEffect(() => {
    const timedToggle = setTimeout(() => {
      if (willReceiveDrop && isDropAllowed && !node.isOpen) {
        node.toggle();
      }
    }, 500);

    return () => clearTimeout(timedToggle);
  }, [willReceiveDrop, isDropAllowed, node]);

  return (
    <BlockContextMenu id={id}>
      <div
        onClick={handleNodeClickWithoutPropagating}
        onMouseEnter={() => debouncedSetHighlighted(id)}
        style={style}
        data-node-id={id}
        ref={dragHandle}
        className={cn(
          "group flex !h-fit w-full items-center justify-between space-x-px py-px",
          isSelected ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800",
          isDropAllowed && willReceiveDrop && "bg-green-200 text-green-600",
          isDragging && "opacity-20",
        )}>
        <div className="flex items-center">
          <div
            className={`flex h-4 w-4 rotate-0 transform cursor-pointer items-center justify-center text-xs transition-transform duration-100 ${
              node.isOpen ? "rotate-90" : ""
            }`}>
            {hasChildren && (
              <button onClick={handleToggle} type="button">
                <TriangleRightIcon />
              </button>
            )}
          </div>
          <button type="button" className="flex items-center">
            <div className="-mt-0.5 h-3 w-3">
              <TypeIcon type={data?._type} />
            </div>
            {isEditing ? (
              <Input node={node} />
            ) : (
              <div
                className="ml-2 truncate text-[11px]"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  node.edit();
                  node.deselect();
                }}>
                {data?._type}
              </div>
            )}
          </button>
        </div>
        <div className="invisible flex items-center space-x-1 pr-2 group-hover:visible">
          {outlineItems.map((outlineItem) => (
            <Tooltip>
              <TooltipTrigger
                className="cursor-pointer rounded bg-transparent hover:bg-white hover:text-blue-500"
                asChild>
                {outlineItem.item(id)}
              </TooltipTrigger>
              <TooltipContent className="z-[9999]">{outlineItem.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </BlockContextMenu>
  );
});

const Input = ({ node }) => {
  return (
    <input
      autoFocus
      className="ml-2 w-full rounded-sm border border-black/30 bg-transparent px-1 text-[11px] outline-none"
      type="text"
      defaultValue={node.data.name}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()} //save on blur
      onKeyDown={(e) => {
        if (e.key === "Escape") node.reset();
        if (e.key === "Enter") node.submit(e.currentTarget.value);
      }}
    />
  );
};

const ListTree = () => {
  const [treeData] = useAtom(treeDSBlocks);

  const [ids, setIds] = useSelectedBlockIds();
  const [, setStyleBlocks] = useSelectedStylingBlocks();
  const { moveBlocks } = useBlocksStoreUndoableActions();

  const clearSelection = () => {
    setIds([]);
    setStyleBlocks([]);
  };

  const onRename = ({ id, name }) => {
    console.log("onRename", { id, name });
  };
  const onMove = ({ dragIds, parentId, index }) => {
    moveBlocks(dragIds, parentId, index);
  };
  const onDelete = ({ ids }) => {
    console.log("onDelete", { ids });
  };

  const onSelect = (nodes: any) => {
    if (nodes.length === 0) return;
    const nodeId = nodes[0] ? nodes[0].id : "";
    setStyleBlocks([]);
    setIds([nodeId]);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLDivElement;
    const nodeId =
      target.getAttribute("data-node-id") || target.closest("[data-node-id]")?.getAttribute("data-node-id");
    if (nodeId) {
      setStyleBlocks([]);
      setIds([nodeId]);
    }
  };

  return (
    <div className={cn("-mx-1 -mt-1 flex h-full select-none flex-col space-y-1")} onClick={() => clearSelection()}>
      <ScrollArea id="outline-view" className="no-scrollbar h-full overflow-y-auto p-1 px-2 text-xs">
        <Tree
          className="max-w-full !overflow-hidden"
          selection={ids[0] || ""}
          onRename={onRename}
          openByDefault={false}
          onMove={onMove}
          rowHeight={20}
          onDelete={onDelete}
          data={treeData}
          renderCursor={DefaultCursor}
          onSelect={onSelect}
          childrenAccessor={(d: any) => d.children}
          width={"100%"}
          renderDragPreview={DefaultDragPreview}
          indent={10}
          onContextMenu={onContextMenu}
          disableDrop={({ parentNode, dragNodes }) =>
            !canDropBlock(null, {
              dragSource: dragNodes[0],
              dropTarget: parentNode,
            })
          }
          idAccessor={"_id"}>
          {Node as any}
        </Tree>
      </ScrollArea>
    </div>
  );
};

export default ListTree;
