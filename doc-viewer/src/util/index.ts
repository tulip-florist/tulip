import { FileTypes, Annotation, Doc } from "../types/types";
import equal from "deep-equal";
import { Logger } from "./logging";
import { isEqual } from "lodash";

export const getFileHash = async (file: File) => {
  // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
  const digest = await crypto.subtle.digest(
    "SHA-256",
    await file.arrayBuffer()
  );
  const hashArray = Array.from(new Uint8Array(digest)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
};

export const getFileType = (file: File): FileTypes | undefined => {
  if (file.type === FileTypes.pdf) {
    return FileTypes.pdf;
  } else if (file.type === FileTypes.epub) {
    return FileTypes.epub;
  } else {
    return undefined;
  }
};

export const mergeDocs = ({
  ancestor,
  local,
  upstream,
}: {
  ancestor?: Doc;
  local: Doc;
  upstream?: Doc;
}): Doc => {
  Logger.info("(mergeDocs)");
  const mergedAnnotations = mergeAnnotations({
    ancestor: ancestor?.annotations,
    local: local.annotations,
    upstream: upstream?.annotations,
  });

  return {
    documentHash: local.documentHash,
    annotations: mergedAnnotations,
  };
};

const mergeAnnotations = ({
  ancestor = [],
  local,
  upstream = [],
}: {
  ancestor?: Array<Annotation>;
  local: Array<Annotation>;
  upstream?: Array<Annotation>;
}) => {
  const ancestorObj = annoArrToAnnoObj(ancestor);
  const localObj = annoArrToAnnoObj(local);
  const upstreamObj = annoArrToAnnoObj(upstream);

  const mergedObj = merge({
    ancestor: ancestorObj,
    local: localObj,
    upstream: upstreamObj,
  });
  const mergedArr = annoObjToAnnoArr(mergedObj);
  return mergedArr;
};

const annoArrToAnnoObj = (
  annotations: Array<Annotation>
): Record<string, any> => {
  return annotations.reduce((acc, it) => {
    return { ...acc, [it.id]: it };
  }, {});
};

const annoObjToAnnoArr = (annotations: object): Array<Annotation> => {
  return Object.entries(annotations).reduce((acc: Array<Annotation>, it) => {
    return [...acc, it[1]];
  }, []);
};

const merge = ({
  ancestor,
  local,
  upstream,
}: {
  ancestor: Record<string, any>;
  local: Record<string, any>;
  upstream: Record<string, any>;
}): Record<string, any> => {
  let solvedConflicts = Object.entries(ancestor).reduce((acc, it) => {
    const key = it[0];
    if (upstream[key]) {
      const localEqualAncestor = equal(ancestor[key], local[key]);
      const upstreamEqualAncestor = equal(ancestor[key], upstream[key]);

      if (localEqualAncestor && upstreamEqualAncestor) {
        return { ...acc, [key]: ancestor[key] };
      }

      if (!upstreamEqualAncestor) {
        return { ...acc, [key]: upstream[key] };
      }

      if (!localEqualAncestor && local[key]) {
        return { ...acc, [key]: local[key] };
      }
    }
    return acc;
  }, {});

  const upstreamAdds = subtractObjects(upstream, ancestor);
  const localAdds = subtractObjects(local, ancestor);

  return { ...solvedConflicts, ...upstreamAdds, ...localAdds };
};

const subtractObjects = (
  a: Record<string, any>,
  b: Record<string, any>
): Record<string, any> => {
  const substraction = Object.keys(a).reduce((acc, it) => {
    if (b[it]) {
      return acc;
    } else {
      return { ...acc, [it]: a[it] };
    }
  }, {});
  return substraction;
};

export const compareDocs = (a?: Doc, b?: Doc): boolean => {
  const res = [
    isEqual(a?.documentHash, b?.documentHash),
    isEqual(
      annoArrToAnnoObj(a?.annotations || []),
      annoArrToAnnoObj(b?.annotations || [])
    ),
  ].every((it) => Boolean(it) === true);

  return res;
};
