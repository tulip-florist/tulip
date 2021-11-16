import {
  Action,
  ActionTypes,
  Annotation as AnnotationType,
} from "../types/types";
import { v4 as uuidv4 } from "uuid";

export const annotationsReducer = (
  annotations: Array<AnnotationType>,
  action: Action
) => {
  switch (action.type) {
    case ActionTypes.CREATE_ANNOTATION: {
      const newAnnotation = { ...action.payload.annotation, id: uuidv4() };
      const updatedAnnotations: Array<AnnotationType> = [
        ...annotations,
        newAnnotation,
      ];
      return updatedAnnotations;
    }
    case ActionTypes.DELETE_ANNOTATION: {
      const filteredAnnotations = annotations.filter(
        (annotation) => annotation.id !== action.payload.annotationId
      );
      return filteredAnnotations;
    }
    case ActionTypes.UPDATE_ANNOTATION: {
      const updatedAnnotations = annotations.map((annotation) => {
        if (annotation.id === action.payload.annotationId) {
          return {
            ...annotation,
            ...action.payload.propsToUpdate,
          };
        } else {
          return annotation;
        }
      });

      return updatedAnnotations;
    }
    case ActionTypes.SET_ANNOTATIONS: {
      return action.payload.annotations;
    }
    case ActionTypes.CLEAR_ANNOTATIONS: {
      return [];
    }
    default:
      throw new Error("Not a valid action for annotationReducer");
  }
};
